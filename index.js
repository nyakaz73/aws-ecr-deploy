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

//Create a .aws folder in the root home directory to store security config and credentials files.
const configureAwsForLogin = ({ access_key_id, secret_access_key, region }) => {
    try {
        execSync('mkdir ~/.aws');
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
        const repo = execSync(`
        aws ecr create-repository \
        --repository-name ${repo_name} \
        --image-scanning-configuration scanOnPush=${scan_on_push} \
        --region ${region}
        `).toString();
        console.log(repo);
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

const buildImage = ({ use_compose, image_name, docker_path }) => {
    try {
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
        if (use_compose === 'true') {

        } else {
            if (repo_uri !== "") {
                const tag = execSync(`docker tag ${image_name}:${tag_name} ${repo_uri}:${tag_name}`).toString();
                console.log(tag);
            } else {
                const tag = execSync(`docker tag ${image_name}:${tag_name} ${aws_account_id}.dkr.ecr.${region}.amazonaws.com/${repo_name}:${tag_name}`).toString();
                console.log(tag);
            }
        }
    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}

const pushImage = ({ }) => {
    try {
        if (use_compose === 'true') {

        } else {

        }

    } catch (error) {
        console.log(error.message);
        core.setFailed(error.message);
    }
}