DIR:=$(CURDIR)
APP_NAME:=l3ku/stockpal-ui
APP_VERSION:=0.0.1
LOCAL_PORT:=8888
DOCKER_PORT:=8888

default: run

build:
	docker build -t $(APP_NAME):$(APP_VERSION) $(DIR)

all: build
	run

run:
	docker run -it -v $(DIR)/project:/project -p $(LOCAL_PORT):$(DOCKER_PORT) -e PORT=$(DOCKER_PORT) l3ku/stockpal-ui:$(APP_VERSION)
