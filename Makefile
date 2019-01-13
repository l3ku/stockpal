default: run

build:
	docker-compose build

all: build
	run

run:
	docker-compose up -d

clean:
	docker-compose kill
	docker-compose rm -f -v
