const { IAMClient, AttachRolePolicyCommand, CreateRoleCommand, GetRoleCommand, PutRolePolicyCommand } = require("@aws-sdk/client-iam"); // CommonJS import
//const region = {region: 'us-west-2'}

const createRole = async (AssumeRolePolicyDocument, RoleName, region) => {
  const client = new IAMClient(region);
  const input = {
    AssumeRolePolicyDocument,
    RoleName,
  };
  const command = new CreateRoleCommand(input);
  const response = await client.send(command);
  return response.Role;
};

const attachRolePolicy = async (managedPolicyArns, RoleName, region) => {
  const client = new IAMClient(region);
  managedPolicyArns.forEach(async arn => {
    const input = {
      PolicyArn: arn,
      RoleName
    };
    const command = new AttachRolePolicyCommand(input);
    await client.send(command);
  });
};

const putRolePolicy = async (policies, RoleName, region) => {
  const client = new IAMClient(region);
  policies.forEach(async ({ PolicyName, PolicyDocument }) => {
    const input = {
      PolicyName,
      PolicyDocument: JSON.stringify(PolicyDocument),
      RoleName
    };
    const command = new PutRolePolicyCommand(input);
    await client.send(command);
  });
};

const getRole = async (RoleName, region) => {
  const client = new IAMClient(region);
  const input = { RoleName };
  const command = new GetRoleCommand(input);
  return await client.send(command);
};

const createCWTaskRole = async (clusterName, assumeRolePolicyDocument, region, awsAccountID) => {
  const roleName = `${clusterName}-prometheus-cw-task-role`;
  const cwTaskRole = await createRole(assumeRolePolicyDocument, roleName, region);
  const managedPolicyArns = [
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ];
  await attachRolePolicy(managedPolicyArns, roleName, region);
  const inLinePolicies = [
    {
      "PolicyName": "ECSServiceDiscoveryInlinePolicy",
      "PolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "ecs:DescribeTasks",
              "ecs:ListTasks",
              "ecs:DescribeContainerInstances",
              "ecs:DescribeServices",
              "ecs:ListServices"
            ],
            "Resource": "*",
            "Condition": {
              "ArnEquals": {
                "ecs:cluster": `arn:aws:ecs:${region}:${awsAccountID}:cluster/${clusterName}`
              }
            }
          },
          {
            "Effect": "Allow",
            "Action": [
              "ec2:DescribeInstances",
              "ecs:DescribeTaskDefinition"
            ],
            "Resource": "*"
          }
        ]
      }
    }
  ];
  await putRolePolicy(inLinePolicies, roleName, region);
  const response = await getRole(roleName, region);
  return response.Role;
};

const createCWExecutionRole = async (clusterName, assumeRolePolicyDocument, region) => {
  const roleName = `${clusterName}-prometheus-cw-execution-role`;
  const cwExecutionRole = await createRole(assumeRolePolicyDocument, roleName, region);
  const managedPolicyArns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ];
  await attachRolePolicy(managedPolicyArns, roleName, region);
  const response = await getRole(roleName, region);
  return response.Role;
};

module.exports = {
  createCWExecutionRole,
  createCWTaskRole,
};
