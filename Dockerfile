FROM node:12.3.1

ADD . /wrm

ENTRYPOINT node /wrm/wrm.js
