up:
	docker-compose up

down:
	docker-compose down

wipe:
	docker-compose down -v

users:
	docker-compose exec meemo ./admin users

user-add:
	@read -p "Username: " username; \
	 read -p "Display Name: " displayname; \
	 stty -echo; \
	 read -p "Password: " password; \
	 stty echo; \
	 echo "Creating a user for '$$displayname'…"; \
	 docker-compose exec meemo ./admin user-add -u $$username -p $$password --display-name $$displayname

user-edit:
	@read -p "Username: " username; \
	 read -p "Display Name: " displayname; \
	 stty -echo; \
	 read -p "Password: " password; \
	 stty echo; \
	 echo "Editing user '$$username'…"; \
	 docker-compose exec meemo ./admin user-edit -u $$username -p $$password --display-name $$displayname


user-del:
	@read -p "Username: " username; \
	 echo "Removing user '$$username'…"; \
	 docker-compose exec meemo ./admin user-del -u $$username