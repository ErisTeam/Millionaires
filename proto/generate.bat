:: Turn of echoing commands
@ECHO off

ECHO Generating go protobuf representation...

PUSHD ..\server\
protoc --go_out=.\ ..\proto\*.proto  --proto_path=..\proto\
POPD

ECHO Generating js protobuf representation...

:: pnpm will end this batch program abruptly... it should be changed to run the command directly but I can't get it to work soooo
:: FIXME: Make it execute the raw command instead of doing it through pnpm
PUSHD ..\client\
pnpm build-protobuf
POPD

ECHO Done.
