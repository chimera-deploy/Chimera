## Chimera

![chimera logo](./assets/Chimera_logo_on_dark.png)

Chimera automates canary deployments for containerized microservices that communicate synchronously on AWS.
It reduces the risk of introducing bugs that propagate through your microservice infrastructure by gradually shifting traffic to a canary version of your service while automating simple threshold canary analysis.

(diagram)

Currently, Chimera supports canary deployments for microservices that run on ECS/Fargate and communicate via App Mesh.
For monitoring metrics, Chimera uses a Prometheus-configured CloudWatch agent that Chimera must set up before it can perform canary deployments.

For more information, please see Chimera's official webpage (link).

## Installation and Setup

Chimera is deployed with Docker-Compose. Please ensure that both [Docker](https://docs.docker.com/install/) and [Docker-Compose](https://docs.docker.com/compose/install/) are running on your machine.

To install Chimera, clone *this* repository. You can use the following terminal command:

```bash
git clone https://github.com/chimera-deploy/Chimera.git && cd Chimera
```

Once you are inside the Chimera directory, create an `.env` file and add the following:

```
AWS_ACCESS_KEY_ID=<your aws access key id>
AWS_SECRET_ACCESS_KEY=<your aws secret access key>
```

Save that file and close it. Once that is complete, you only need to execute the following command:

```bash
docker-compose up
```

Chimera will now be ready to set up the Prometheus-configured CloudWatch agent in your ECS cluster. You can access Chimera's UI at port 3000. Once there, have Chimera perform the automatic deployment of the CloudWatch agent unless you've already had Chimera do this before. After the CloudWatch agent is set up, your teams can perform canary deployments on your microservices.

To remove Chimera from your machine, simply execute:

```bash
docker-compose down
```

## Team

**Ohio, USA**
- Josh Leath (LinkedIn, GitHub)

**Pennsylvania, USA**
- Trevor Kelly (LinkedIn, GitHub)

**Massachusettes, USA**
- Will Rossen (LinkedIn, GitHub)
- Wes Anderson (LinkedIn, GitHub)

## Show your support

Give a ⭐️ if you liked this project!

***