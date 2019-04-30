default: run

build:
	docker-compose -f docker-compose.yml build

build-prod:
	docker-compose -f docker-compose.yml -f docker-compose-prod.yml build

all: build run

run:
	docker-compose -f docker-compose.yml up -d

deploy:
	docker-compose -f docker-compose.yml -f docker-compose-prod.yml up -d

clean:
	docker-compose kill
	docker-compose rm -f -v
