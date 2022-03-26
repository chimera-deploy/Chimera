const { EC2Client, AuthorizeSecurityGroupIngressCommand, CreateSecurityGroupCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
const region = {region: 'us-west-2'}

const createSG = async (Description, GroupName, VpcId) => {
  const client = new EC2Client(region);
  const input = {
    Description,
    GroupName,
    VpcId
  };
  const command = new CreateSecurityGroupCommand(input);
  return await client.send(command);
};

const authorizeSGIngress = async (CidrIp, FromPort, ToPort, GroupId, IpProtocol) => {
  const client = new EC2Client(region);
  const input = {
    CidrIp,
    FromPort,
    ToPort,
    GroupId,
    IpProtocol
  };
  const command = new AuthorizeSecurityGroupIngressCommand(input);
  await client.send(command);
};

const createCWSecurityGroup = async (vpcID) => {
  const response = await createSG("cloud watch agent sg for chimera", "chimera-cw-sg", vpcID);
  const sgID = response.GroupId;
  await authorizeSGIngress("0.0.0.0/0", 9901, 9901, sgID, "tcp");
  return sgID;
};

module.exports = {
  createCWSecurityGroup,
};
