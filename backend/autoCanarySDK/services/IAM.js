const { IAMClient, AttachRolePolicyCommand, CreateRoleCommand, GetRoleCommand, PutRolePolicyCommand } = require("@aws-sdk/client-iam"); // CommonJS import

const createRole = async (AssumeRolePolicyDocument, RoleName, clientRegion) => {
  const client = new IAMClient(clientRegion);
  const input = {
    AssumeRolePolicyDocument,
    RoleName,
  };
  const command = new CreateRoleCommand(input);
  const response = await client.send(command);
  return response.Role;
};

const attachRolePolicy = async (managedPolicyArns, RoleName, clientRegion) => {
  const client = new IAMClient(clientRegion);
  managedPolicyArns.forEach(async arn => {
    const input = {
      PolicyArn: arn,
      RoleName
    };
    const command = new AttachRolePolicyCommand(input);
    await client.send(command);
  });
};

const putRolePolicy = async (policies, RoleName, clientRegion) => {
  const client = new IAMClient(clientRegion);
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

const getRole = async (RoleName, clientRegion) => {
  const client = new IAMClient(clientRegion);
  const input = { RoleName };
  const command = new GetRoleCommand(input);
  return await client.send(command);
};

const createCWTaskRole = async (clusterName, assumeRolePolicyDocument, region, awsAccountID, clientRegion) => {
  const roleName = `${clusterName}-prometheus-cw-task-role`;
  const cwTaskRole = await createRole(assumeRolePolicyDocument, roleName, clientRegion);
  const managedPolicyArns = [
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ];
  await attachRolePolicy(managedPolicyArns, roleName, clientRegion);
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
  await putRolePolicy(inLinePolicies, roleName, clientRegion);
  const response = await getRole(roleName, clientRegion);
  return response.Role;
};

const createCWExecutionRole = async (clusterName, assumeRolePolicyDocument, clientRegion) => {
  const roleName = `${clusterName}-prometheus-cw-execution-role`;
  const cwExecutionRole = await createRole(assumeRolePolicyDocument, roleName, clientRegion);
  const managedPolicyArns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ];
  await attachRolePolicy(managedPolicyArns, roleName, clientRegion);
  const response = await getRole(roleName, clientRegion);
  return response.Role;
};

module.exports = {
  createCWExecutionRole,
  createCWTaskRole,
};
