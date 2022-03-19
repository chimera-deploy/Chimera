const { IAMClient, AttachRolePolicyCommand, CreateRoleCommand, GetRoleCommand, PutRolePolicyCommand } = require("@aws-sdk/client-iam"); // CommonJS import

const createRole = async (AssumeRolePolicyDocument, RoleName) => {
  const client = new IAMClient();
  const input = {
    AssumeRolePolicyDocument,
    RoleName,
  };
  const command = new CreateRoleCommand(input);
  const response = await client.send(command);
  return response.Role;
};

const attachRolePolicy = async (managedPolicyArns, RoleName) => {
  const client = new IAMClient();
  managedPolicyArns.forEach(async arn => {
    const input = {
      PolicyArn: arn,
      RoleName
    };
    const command = new AttachRolePolicyCommand(input);
    await client.send(command);
  });
};

const putRolePolicy = async (policies, RoleName) => {
  const client = new IAMClient();
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

const getRole = async (RoleName) => {
  const client = new IAMClient();
  const input = { RoleName };
  const command = new GetRoleCommand(input);
  return await client.send(command);
};

const createCWTaskRole = async (clusterName, assumeRolePolicyDocument, region, awsAccountID) => {
  const roleName = `${clusterName}-prometheus-cw-task-role`;
  const cwTaskRole = await createRole(assumeRolePolicyDocument, roleName);
  const managedPolicyArns = [
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ];
  await attachRolePolicy(managedPolicyArns, roleName);
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
  await putRolePolicy(inLinePolicies, roleName);
  const response = await getRole(roleName);
  return response.Role;
};

const createCWExecutionRole = async (clusterName, assumeRolePolicyDocument) => {
  const roleName = `${clusterName}-prometheus-cw-execution-role`;
  const cwExecutionRole = await createRole(assumeRolePolicyDocument, roleName);
  const managedPolicyArns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  ];
  await attachRolePolicy(managedPolicyArns, roleName);
  const response = await getRole(roleName);
  return response.Role;
};

module.exports = {
  createCWExecutionRole,
  createCWTaskRole,
};
