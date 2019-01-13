DIR:=$(CURDIR)
APP_NAME:=l3ku/stockpal-api
CONTAINER_NAME:=stockpal_api
APP_VERSION:=0.0.1
LOCAL_PORT:=9000
DOCKER_PORT:=3000

default: run

build:
	docker build -t $(APP_NAME):$(APP_VERSION) $(DIR)

all: build run

run:
	docker run -it -v $(DIR)/project:/project -p $(LOCAL_PORT):$(DOCKER_PORT) --name $(CONTAINER_NAME) $(APP_NAME):$(APP_VERSION)

clean:
	docker ps --all -f status=exited | grep $(CONTAINER_NAME) | cut -d ' ' -f 1 | xargs docker rm
	docker rmi -f $(APP_NAME):$(APP_VERSION)
