const { AppMeshClient, ListVirtualNodesCommand, ListVirtualRoutersCommand, ListRoutesCommand } = require("@aws-sdk/client-app-mesh");
const { builtinModules } = require("module");
const region = {region: 'us-west-2'}

const AppMesh = {
  async nodeNames(meshName) {
    const input = {
      meshName,
    };

    const command = new ListVirtualNodesCommand(input);
    const client = new AppMeshClient(region);

    const response = await client.send(command);
    const nodes = response.virtualNodes;
    return nodes.map(node => node.virtualNodeName);
  },

  async routesByRouter(meshName) {
    const routerNames = await this.routerNames(meshName);
    let promises = [];
    let routes = {};

    for (let i = 0; i < routerNames.length; i++) {
      const p = new Promise(async (resolve, reject) => {
        try {
          const routeNames = await this.routeNames(meshName, routerNames[i]);
          routes[routerNames[i]] = routeNames;
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      promises.push(p);
    }

    await Promise.all(promises);
    return routes;
  },

  async routeNames(meshName, virtualRouterName) {
    const input = {
      meshName,
      virtualRouterName,
    };

    const command = new ListRoutesCommand(input);
    const client = new AppMeshClient(region);

    const response = await client.send(command);
    const routes = response.routes
    return routes.map(route => route.routeName);
  },

  async routerNames(meshName) {
    const input = {
      meshName,
    }

    const command = new ListVirtualRoutersCommand(input);
    const client = new AppMeshClient(region);

    const response = await client.send(command);
    const routers =  response.virtualRouters;
    return routers.map(router => router.virtualRouterName)
  }
}

module.exports = AppMesh;