# There is no official "node + python" image, and installing
# all of node and all of python on top of bare debian takes
# ages, so let's use one as a base and install the other.
FROM node:20
RUN apt update && apt install -y curl python3-venv procps
