CC=gcc
CFLAGS=-O2 -I./blake2b -I./tweetnacl -Wall -Wextra -std=c99 -pedantic -Wno-long-long

all:	poolid

tweetnacl/%.o: tweetnacl/%.c tweetnacl/%.h
blake2b/%.o: blake2b/%.c blake2b/%.h
%.o: %.c
	$(CC) -c -o $@ $< $(CFLAGS)

poolid: poolid.o tweetnacl/randombytes.o tweetnacl/tweetnacl.o blake2b/blake2b-ref.o
	$(CC) -o $@ $^ $(CFLAGS)

clean:
	rm -rf *.o tweetnacl/*.o blake2b/*.o poolid
