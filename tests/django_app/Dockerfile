#pull official base image
FROM python:3.8-alpine

#set work directory
WORKDIR /app

#set environment variables
#Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
#Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1
ENV DEBUG 0

#install psycopg2
#RUN apk update \
#    && apk add --virtual build-deps gcc python3-dev musl-dev \
#    && apk add postgresql-dev \
#    && pip install psycopg2 \
#    && apk del build-deps

#install zlib to alliw Pillow wheel build
#RUN apk add zlib-dev jpeg-dev gcc musl-dev

#install dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt

#copy entrypoint.sh and make it executable
#COPY ./entrypoint.sh .
#RUN chmod +x entrypoint.sh

# copy project
COPY . .

#run entrypoint.sh
#ENTRYPOINT [ "/app/entrypoint.prod.sh" ]

#comment out since we are now using docker compose to with postgres service to build the image
#collect static files
RUN python manage.py collectstatic --noinput

#make migrations and migrate
RUN python manage.py makemigrations && python manage.py migrate

# add and run as non-root user BEST PRACTICES EPS when deploting to heroku as it uses non root user
RUN adduser -D myuser
USER myuser

# run gunicorn  Gunicorn 'Green Unicorn' is a Python WSGI HTTP Server for UNIX. It's a pre-fork worker model. 
CMD gunicorn django_app.wsgi:application --bind 0.0.0.0:8000
#CMD python manage.py runserver 0.0.0.0:8000

#To test Locally
# --Build Image
#$> docker build -t mydjangoapp:latest .
# --Run Container
#$> docker run -it -d -p 8000:8000 mydjangoapp
#Running a local server of Django is not a recommended way in production because
# it’s just a test server not a production ready server. So to run Django in production
# is to run with Gunicorn and use Nginx as a reverse proxy so it gives more security to our application.