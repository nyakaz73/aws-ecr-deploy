const core = require('@actions/core');
const { execSync } = require('child_process');

//Variables
let aws = {
    'access_key_id': core.getInput('access_key_id'),
    'secret_access_key': core.getInput('secret_access_key'),
    'region': core.getInput('region'),
    'aws_account_id': core.getInput('aws_account_id'),
    'force_push': core.getInput('force_push'),
    'working_dir': core.getInput('working-directory')
}

//Exec options
let execOptions = {
    cwd: aws.working_dir,
}

//Create a .aws folder in the root home directory to store security config and credentials files.
const configureAwsForLogin = ({ access_key_id, secret_access_key, region }) => {
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

