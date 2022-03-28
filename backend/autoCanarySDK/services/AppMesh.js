const { AppMeshClient, ListVirtualNodesCommand, ListVirtualRoutersCommand, ListRoutesCommand } = require("@aws-sdk/client-app-mesh");
const { builtinModules } = require("module");

const AppMesh = {
  async nodeNames(meshName, clientRegion) {
    const input = {
      meshName,
    };

    const command = new ListVirtualNodesCommand(input);
    const client = new AppMeshClient(clientRegion);

    const response = await client.send(command);
    const nodes = response.virtualNodes;
    return nodes.map(node => node.virtualNodeName);
  },

  async routesByRouter(meshName, clientRegion) {
    const routerNames = await this.routerNames(meshName, clientRegion);
    let promises = [];
    let routes = {};

    for (let i = 0; i < routerNames.length; i++) {
      const p = new Promise(async (resolve, reject) => {
        try {
          const routeNames = await this.routeNames(meshName, routerNames[i], clientRegion);
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

  async routeNames(meshName, virtualRouterName, clientRegion) {
    const input = {
      meshName,
      virtualRouterName,
    };

    const command = new ListRoutesCommand(input);
    const client = new AppMeshClient(clientRegion);

    const response = await client.send(command);
    const routes = response.routes
    return routes.map(route => route.routeName);
  },

  async routerNames(meshName, clientRegion) {
    const input = {
      meshName,
    }

    const command = new ListVirtualRoutersCommand(input);
    const client = new AppMeshClient(clientRegion);

    const response = await client.send(command);
    const routers =  response.virtualRouters;
    return routers.map(router => router.virtualRouterName)
  }
}

module.exports = AppMesh;