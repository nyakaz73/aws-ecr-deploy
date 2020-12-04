const core = require('@actions/core');
const { execSync } = require('child_process');

//Variables
let aws = {
    'access_key_id': core.getInput('access_key_id'),
    'secret_access_key': core.getInput('secret_access_key'),
    'region': core.getInput('region'),
    'aws_account_id': core.getInput('aws_account_id'),
    'repo_name': core.getInput('repo_name'),
    'scan_on_push': core.getInput('scan_on_push'),
    'image_name': core.getInput('image_name'),
    'use_compose': core.getInput('use_compose'),
    'docker_path': core.getInput('docker_path'),
    'repo_uri': core.getInput('repo_url'),
    'tag_name': core.getInput('tag_name'),
    'force_push': core.getInput('force_push'),
    'working_dir': core.getInput('working-directory')
}

//Exec options
let execOptions = {
    cwd: aws.working_dir,
}

const installAwsCli = () => {
    try {
        const curl = execSync(`curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`).toString();
        console.log(curl);
        const unzip = execSync('unzip awscliv2.zip').toString();
        console.log(unzip);
        const install = execSync("sudo ./aws/install").toString();
        console.log(install);
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

//Create a .aws folder in the root home directory to store security config and credentials files.
const configureAwsForLogin = ({ access_key_id, secret_access_key, region }) => {
    try {
        try {
            execSync('mkdir ~/.aws');
        } catch (error) {
            console.log(error.message)
        }
        execSync(`cat >~/.aws/config <<EOF
[default]
region = ${region}
output = json
    `);
        execSync(`cat >~/.aws/credentials <<EOF
[default]
aws_access_key_id = ${access_key_id}
aws_secret_access_key = ${secret_access_key}
    `);
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}


const login = ({ region, aws_account_id }) => {
    try {
        configureAwsForLogin(aws);
        const login = execSync(`aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${aws_account_id}.dkr.ecr.${region}.amazonaws.com`).toString();
        console.log(login);
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

const createRepository = ({ repo_name, region, scan_on_push }) => {
    try {
        const repos = execSync('aws ecr describe-repositories').toString();
        console.log(repos);
        const reposJson = JSON.parse(repos);
        reposJson.repositories.forEach((repos) => {
            console.log(repos);
            if (repos.repositoryName === repo_name) {
                return;
            }
        });
        console.log('Creating Repository *********************');
        const repo = execSync(`
        aws ecr create-repository \
        --repository-name ${repo_name} \
        --image-scanning-configuration scanOnPush=${scan_on_push} \
        --region ${region}
        `).toString();
        console.log(repo);
        console.log('Repository successfully created');
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

const buildImage = ({ use_compose, image_name, docker_path }) => {
    try {
        console.log('Building Image *********************');
        if (use_compose === 'true') {
            const build = execSync(`docker-compose build`, execOptions).toString();
            console.log(build);

        } else {
            const build = execSync(`docker build -t ${image_name} ${docker_path}`, execOptions).toString();
            console.log(build);
        }
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

//Put an option to allow users to tag their docker-compose files
const tagImage = ({ use_compose, image_name, aws_account_id, repo_uri, tag_name, region, repo_name }) => {
    try {
        console.log('Tag Image *********************');
        if (use_compose === 'true') {

        } else {
            if (repo_uri !== "") {
                const tag = execSync(`docker tag ${image_name}:${tag_name} ${repo_uri}:${tag_name}`).toString();
                console.log(tag);
            } else {
                //No repo was created so need to create a repo
                if (repo_name === "") {
                    const newRepoData = {
                        'repo_name': image_name,
                        'region': aws.region,
                        'scan_on_push': aws.scan_on_push
                    }
                    createRepository(newRepoData);
                    //Tag repo with image name as repo name
                    const tag = execSync(`docker tag ${image_name}:${tag_name} ${aws_account_id}.dkr.ecr.${region}.amazonaws.com/${image_name}:${tag_name}`).toString();
                    console.log(tag);

                } else {
                    //Here we need to check  if the repo exists else create repo again.
                    const tag = execSync(`docker tag ${image_name}:${tag_name} ${aws_account_id}.dkr.ecr.${region}.amazonaws.com/${repo_name}:${tag_name}`).toString();
                    console.log(tag);
                }

            }
        }
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

const pushImage = ({ aws_account_id, region, repo_name, tag_name, repo_uri, image_name, use_compose }) => {
    try {
        console.log('Pushing Image ********************');
        if (use_compose === 'true') {
            const push = execSync(`docker-compose push`).toString();
            console.log(push);
        } else {
            if (repo_uri !== "") {
                const push = execSync(`docker push ${repo_uri}:${tag_name}`).toString();
                console.log(push);
            } else {
                //If repo name is not provided use image_name that was created in tagging instead
                if (repo_name === "") {
                    const push = execSync(`docker push ${aws_account_id}.dkr.ecr.${region}.amazonaws.com/${image_name}:${tag_name}`).toString();
                    console.log(push);
                } else {
                    const push = execSync(`docker push ${aws_account_id}.dkr.ecr.${region}.amazonaws.com/${repo_name}:${tag_name}`).toString();
                    console.log(push);
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

/*This order is to kept as is:*/
//Probably need a Snapshot test
installAwsCli();
configureAwsForLogin(aws);
login(aws);
buildImage(aws);
tagImage(aws);
pushImage(aws);

core.setOutput(
    "status",
    "Successfully deployed image(s) to AWS ECR"
);