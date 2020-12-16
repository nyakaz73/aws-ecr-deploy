# aws-ecr-deploy
Github action that deploys image container(s) to aws Elastic Container Registry (ECR)

### Show some :heart: and :star: the repo to support the project

## Getting Started
aws-ecr-deploy uses two method to push your image containers to aws ECR ie:
* 1. Push with Dockerfile
* 2. Push with docker-compose file


Make sure you have a Dockerfile in the root directory of your project.

### 1. Push with dockerfile
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