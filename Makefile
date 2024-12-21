bob:
	npx hardhat run src/bob.ts --network localhost

alice:
	npx hardhat run src/alice.ts --network localhost

node: reset
	ETHERNAL_EMAIL='your@mail.com' ETHERNAL_PASSWORD='your_passw0rd' npx hardhat node

main:
	npx hardhat run src/main.ts --network localhost

reset:
	ETHERNAL_EMAIL='your@mail.com' ETHERNAL_PASSWORD='your_passw0rd' ethernal reset bcb-x3dh
