#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>
#include <time.h>

#include "tweetnacl.h"

#include "blake2.h"

void arr2hex(unsigned char *in, size_t inlen)
{
	for (size_t i = 0; i < inlen; i++)
		printf("%02x", in[i]);
	printf("\n");
}

void hex2bin(const char *in, size_t inlen, unsigned char *out)
{

	static const unsigned char TBL[] = {
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 58, 59, 60, 61,
		62, 63, 64, 10, 11, 12, 13, 14, 15, 71, 72, 73, 74, 75,
		76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
		90, 91, 92, 93, 94, 95, 96, 10, 11, 12, 13, 14, 15};

	static const unsigned char *LOOKUP = TBL - 48;

	const char *end = in + inlen;

	while (in < end)
	{
		*(out++) = LOOKUP[*(in++)] << 4 | LOOKUP[*(in++)];
	}
}

int main(int argc, char *argv[])
{

	if (argc != 2)
	{
		printf("Only one argument is allowed, e.g.: %s \"0ada\"\n", argv[0]);
		return -127;
	}

	char *prefix_string = argv[1];

	uint8_t prv[64] = {0};
	uint8_t pub[32] = {0};
	uint8_t poolid[28] = {0};

	uint8_t prefix[32] = {0};

	time_t currtime;

	const int prefix_len = strlen(prefix_string);

	hex2bin(prefix_string, prefix_len, prefix);
	arr2hex(prefix, prefix_len / 2);

	printf("Started finding pool id /w \"%s\" prefix\n", prefix_string);

	int count = 0;
	while (memcmp(prefix, poolid, prefix_len / 2))
	{
		crypto_sign_ed25519_tweet_keypair((unsigned char *)&pub, (unsigned char *)&prv);

		//printf("private key:\n");
		//arr2hex(prv, sizeof(prv));

		//printf("\npublic key:\n");
		//arr2hex(pub, sizeof(pub));

		//printf("\npool id:\n");
		blake2b(poolid, sizeof(poolid), pub, sizeof(pub), NULL, 0);

		count++;
		if (count % 1000 == 0)
		{
			currtime = time(NULL);
			printf("date: %d %s", count, ctime(&currtime));
		}
	}
	printf("Found at %d\n", count);
	printf("prv key:\n");
	arr2hex(prv, sizeof(prv));
	printf("pool id:\n");
	arr2hex(poolid, sizeof(poolid));

	return 0;
}