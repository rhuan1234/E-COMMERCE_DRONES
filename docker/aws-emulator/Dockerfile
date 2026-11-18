FROM public.ecr.aws/amazonlinux/amazonlinux:2023-minimal

RUN ARCH=$(uname -m) \
    && rpm -ivh "https://downloads.aws.com/aws-emulator/packages/aws-emulator/LTS/latest/aws-emulator-${ARCH}.rpm"

EXPOSE 9297

ENTRYPOINT ["aws-emulator", "-b", "0.0.0.0", "-p", "9297", "--auth", "off", "--telemetry", "off"]
