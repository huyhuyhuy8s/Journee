bootstrap:
	yarn

# deploy-staging:
# 	curl -X POST -d {} https://api.netlify.com/build_hooks/63c8f0a6383e9c319dbf91e6

# deploy-staging-manual:
# 	npx netlify build --context staging && netlify deploy -m "$$(git show -s --format='%h %s')" -p -s "b4e57fd9-6e95-4121-a8ad-f2b07e3c0e60" || echo "Fail to deploy"

start:
	npx expo-doctor
	yarn start

dev:
	yarn dev

android:
	expo run:android

build:
	eas build --platform android --profile development

doctor:
	npx expo-doctor

update:
	eas update:configure
