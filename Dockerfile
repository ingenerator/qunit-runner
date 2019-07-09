FROM node:alpine

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      harfbuzz@edge \
      freetype@edge \
      nss@edge \
      ttf-freefont@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
# Must specify path to executable
#   const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN npm install \
        puppeteer@1.12.2 \
        light-server \
 && npm cache clean --force \
 && mkdir /workspace

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /workspace

ENV PATH="/node_modules/.bin:${PATH}"

# Run everything after as non-privileged user.
USER pptruser

COPY qunit-runner.js ./
COPY entrypoint.sh ./

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["test", "application/assets/js/tests/qunit_compiled.html"]
