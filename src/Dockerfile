FROM node

#Install langs compilers
RUN apt-get update -y
RUN apt-get install mono-vbnc -y
RUN apt-get install default-jdk -y
RUN apt-get install gcc -y

#Install node deps and move source
ENV topDir /codetree
ENV TERM xterm
RUN echo $topDir
RUN mkdir codetree
WORKDIR codetree
ADD package.json package.json
RUN npm install
ADD ./container_source .
ADD ./lib/program.js .
