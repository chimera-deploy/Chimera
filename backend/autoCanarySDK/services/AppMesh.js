const { AppMeshClient, ListVirtualNodesCommand, ListVirtualRoutersCommand, ListRoutesCommand } = require("@aws-sdk/client-app-mesh");
const { builtinModules } = require("module");

const AppMesh = {
  async nodeNames(meshName) {
    const input = {
      meshName,
    };

    const command = new ListVirtualNodesCommand(input);
    const client = new AppMeshClient();

    const response = await client.send(command);
    const nodes = response.virtualNodes;
    return nodes.map(node => node.virtualNodeName);
  },

  async routersWithRoutes(meshName) {
    const routers = await this.routerNames(meshName);
    const promises = [];
    for (let i = 0; i < routers.length; i++) {
      const p = new Promise(async (resolve, reject) => {
        try {
          const routes = await this.routeNames(meshName, routers[i]);
          routers[i] = {
            name: routers[i],
            routes,
          };
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      promises.push(p);
    }

    await Promise.all(promises);
    return routers;
  },

  async routeNames(meshName, virtualRouterName) {
    const input = {
      meshName,
      virtualRouterName,
    };

    const command = new ListRoutesCommand(input);
    const client = new AppMeshClient();

    const response = await client.send(command);
    const routes = response.routes
    return routes.map(route => route.routeName);
  },

  async routerNames(meshName) {
    const input = {
      meshName,
    }

    const command = new ListVirtualRoutersCommand(input);
    const client = new AppMeshClient();

    const response = await client.send(command);
    const routers =  response.virtualRouters;
    return routers.map(router => router.virtualRouterName)
  }
}

module.exports = AppMesh;