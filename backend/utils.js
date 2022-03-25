const getIDFromArn = arn => {
  const parts = arn.split('/');
  return parts[parts.length - 1];
};

module.exports = {
  getIDFromArn,
};