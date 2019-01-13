DIR:=$(CURDIR)
APP_NAME:=l3ku/stockpal-ui
CONTAINER_NAME:=stockpal_ui
APP_VERSION:=0.0.1
LOCAL_PORT:=8888
DOCKER_PORT:=8888

default: run

build:
	docker build -t $(APP_NAME):$(APP_VERSION) $(DIR)

all: build
	run

run:
	docker run -it -v $(DIR)/app:/app -p $(LOCAL_PORT):$(DOCKER_PORT) -e PORT=$(DOCKER_PORT) $(APP_NAME):$(APP_VERSION)

clean:
	docker ps --all -f status=exited | grep $(CONTAINER_NAME) | cut -d ' ' -f 1 | xargs docker rm
	docker rmi -f $(APP_NAME):$(APP_VERSION)
