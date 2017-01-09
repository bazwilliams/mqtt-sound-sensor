FROM node:4-slim

WORKDIR /usr/src/app

COPY . /usr/src/app

ARG VCS_REF
ARG VERSION
ARG BUILD_DATE

LABEL org.label-schema.vendor="Barry John Williams" \
      org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.docker.dockerfile="/Dockerfile" \
      org.label-schema.version=$VERSION \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.vcs-type="Git" \
      org.label-schema.vcs-url="https://github.com/bazwilliams/mqtt-sound-sensor"

RUN npm install --production --quiet

ENTRYPOINT [ "npm", "run-script" ]

CMD [ "start" ]
