require("dotenv").config();
const express = require("express");
const app = express();
const { CloudFormationClient, CreateStackCommand, DeleteStackCommand } = require("@aws-sdk/client-cloudformation");
const { AppMeshClient, UpdateRouteCommand } = require("@aws-sdk/client-app-mesh");
const HOST = "0.0.0.0";
const PORT = process.env.PORT || "4000";

app.use(express.json());

const deleteStackHandler = async (req, res) => {
  const { id } = req.params
  const { config, input} = req.body;
  input.StackName = id;
  let response;
  try {
    console.log(`requesting to delete stack ${id}`);
    const client = new CloudFormationClient(config);
    const command = new DeleteStackCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`got back error:`, err);
    res
      .status(500)
      .json(err);
    return
  }
  console.log(`got back response:`, response);
  res
    .status(200)
    .json(response);
};

app.delete("/stacks/:id", deleteStackHandler);

const putRouteHandler = async (req, res) => {
  const { id } = req.params;
  const { stablenode, canarynode, stableweight, canaryweight } = req.query;
  const { config, input } = req.body;
  input.routeName = id;
  if (!id.includes("movie")) { // one big hack because lazy
    if (!id.includes("sixties")) {
      input.virtualRouterName = `seventiesmovieserver-vr`;
    } else {
      input.virtualRouterName = `sixtiesmovieserver-vr`;
    }
  } else {
    input.virtualRouterName = `${id.split("-")[0]}-vr`;
  }
  if (stableweight === "0") {
    input.spec = {
      httpRoute: {
        match: {
          prefix: "/"
        },
        action: {
          weightedTargets: [
            {
              virtualNode: canarynode,
              weight: 1
            }
          ]
        }
      }
    };
  } else {
    input.spec = {
      httpRoute: {
        match: {
          prefix: "/"
        },
        action: {
          weightedTargets: [
            {
              virtualNode: canarynode,
              weight: Number(canaryweight)
            },
            {
              virtualNode: stablenode,
              weight: Number(stableweight)
            }
          ]
        }
      }
    };
  }

  let response;
  try {
    console.log(`requesting to update ${id} route`);
    const client = new AppMeshClient(config);
    const command = new UpdateRouteCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`got back error:`, err);
    res
      .status(500)
      .json(err);
    return
  }
  console.log(`got back response:`, response);
  res
    .status(200)
    .json(response);
};

app.put("/routes/:id", putRouteHandler);

const postStackHandler = async (req, res) => {
  const { config, input } = req.body;
  let response;
  try {
    console.log(`requesting to create stack`);
    const client = new CloudFormationClient(config);
    const command = new CreateStackCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`got back error:`, err);
    res
      .status(500)
      .json(err);
    return
  }
  console.log(`got back response:`, response);
  res
    .status(200)
    .json(response);
};

app.post("/stacks", postStackHandler);

app.listen(Number(PORT), HOST, () => console.log(`listening on ${HOST} at ${PORT}`));
