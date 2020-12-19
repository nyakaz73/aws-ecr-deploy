# aws-ecr-deploy
Github action that deploys image container(s) to aws Elastic Container Registry (ECR)

### Show some :heart: and :star: the repo to support the project

## Getting Started
aws-ecr-deploy uses two method to push your image containers to aws ECR ie:
* 1. Push with Dockerfile
* 2. Push with docker-compose file


Make sure you have a Dockerfile in the root directory of your project.

### 1. Push with Dockerfile
By default the action uses the Dockerfile in your root directory to create and push the docker container images to aws ECR. See example below:
In the **with** tag make sure you have the following inputs:
* access_key_id
* secret_access_key 
* *access_key_id* and *secret_access_key* are for aws ECR authentication.
* region
* aws_account_id
* image_name
* *region* and *aws_account_id* you get them from your aws account  ,and image_name is the name you want to give your image upon built.
* **NB** These option automatically creates a repository on your aws ecr with its name being the **image_name**. If you want to give it different name from the image name add the **repo_name** tag. See table below for more options.
If however you have already create the repository on your aws ecr use the **repo_uri** tag .See the options table for an example.
```yml
name: Deploy Container image to aws ECR
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
jobs: 
    aws_ecr_dockerfile_deploy:
        runs-on: ubuntu-latest
        name: AWS ecr deploy- A job that deploys a image container using a aws_ecr_dockerfile_deploy
        steps:
            - name: Checkout
              uses: actions/checkout@v2
            - name: Deploy container image to AWS ECR
              uses: nyakaz73/aws-ecr-deploy@v0.08
              id: deploy 
              with:
                access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                region: ${{ secrets.AWS_REGION }}
                aws_account_id: ${{ secrets.AWS_ACCOUNT_ID }}
                image_name: myapp

            - name: Get the output status
              run: echo "${{ steps.deploy.outputs.status }}"

```
Since the repo_url contains aws_account id , region, and repo_name you can simply use it as below:
To use with repo_uri:
```yml
name: Deploy Container image to aws ECR
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
jobs: 
    aws_ecr_dockerfile_deploy:
        runs-on: ubuntu-latest
        name: AWS ecr deploy- A job that deploys a image container using a aws_ecr_dockerfile_deploy
        steps:
            - name: Checkout
              uses: actions/checkout@v2
            - name: Deploy container image to AWS ECR
              uses: nyakaz73/aws-ecr-deploy@v0.08
              id: deploy 
              with:
                access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                image_name: myapp
                repo_uri: 694554431194.dkr.ecr.eu-west-2.amazonaws.com/myapp

            - name: Get the output status
              run: echo "${{ steps.deploy.outputs.status }}"

```

### 2. Push with docker-compose file
If you have a list of services in you docker-compose file, make sure you add your repository uri, image in your services you want to push to AWS ECR. see example below:

If for example you have **web** and **nginx-proxy** services, update the **image**  propertiesto use images from ECR

```yml
version: '3.7'

services:
  web:
    build:
      context:  ./app
      dockerfile: Dockerfile.prod
    image: <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/myapp-image-ec2:web
    command: 
    ...
    ...
  nginx-proxy:
    build: nginx
    image: <aws-account-id>.dkr.ecr.<aws-region>.amazonaws.com/myapp-image-ec2:nginx-proxy
    ...
    ...
```
The values consist of the repository URI (123456789.dkr.ecr.us-east-1.amazonaws.com) along with the **image name** (myapp-image-ec2) and **tags** (web and nginx-proxy)

#### Example workflow to deploy using docker-compose
**NB** To build and push your image(s) to AWS ECR using a ***docker-compose.yml*** file make sure to add a ***use_compose: true*** tag see example below:
```yml
name: Deploy Container image to aws ECR
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
jobs: 
    aws_ecr_dockerfile_deploy:
        runs-on: ubuntu-latest
        name: AWS ecr deploy- A job that deploys a image(s) container using a aws ecrdocker compose file deploy
        steps:
            - name: Checkout
              uses: actions/checkout@v2
            - name: Deploy container image to AWS ECR
              uses: nyakaz73/aws-ecr-deploy@v0.08
              id: deploy 
              with:
                access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
                secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
                use_compose: true

            - name: Get the output status
              run: echo "${{ steps.deploy.outputs.status }}"

```

* **NB** We did not include ***region***, ***aws_account_id*** , ***image_name*** and or ***repo_uri*** tags because these we would have added them in the ***docker-compose*** file like we did in the example above,


## Options
The action has multiple options, here is a list of options you can use  under the **with** flag in your workflow:
| Name                        | Required  | Description                      | Example                          |
| --------------------------- | --------  | -------------------------------- | -------------------------------- |
|  access_key_id            |  true     | This is the AWS access key id for auth, | access_key_id:  ${{ secrets.AWS_ACCESS_KEY_ID }} |
|  secret_access_key             |  true     | This is the AWS secret access key for auth  | secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }} |
|  region       |  true     | AWS region | region: eu-west-2 |
|  aws_account_id                    |  true    | This is your AWS account id | aws_account_id: ${{ secrets.AWS_ACCOUNT_ID }} |
|  repo_name                 |  false    | AWS ECR Repository name | repo_name:  nginx-repo |
|  image_name         |  false    | This is the name you want to give to your Docker name | image_name: nginx-image |
|  repo_uri     |  false    | AWS ECR Repository URI | repo_uri: 980606782194.dkr.ecr.eu-west-2.amazonaws.com/nginx-repo |
|  tag_name                 |  false    | AWS ECR Repository Image tag name, by default is uses latest as tag name | tag_name: latest |
|  use_compose                 |  false    | Build image from docker compose file | use_compose: true |
|  docker_path                 |  false    | Path to Dockerfile or docker-compose file | docker_path: ./newfolder_in_root |
|  working-directory          |  false    | Used when you want to specify a different working directory for your root app directory from default ./ | working-directory: ./newfolder_in_root/djangoapp |


## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/nyakaz73/aws-ecr-deploy/blob/master/LICENSE) file for details