# Production image — Romial Kenmogne website (Next.js 16 + Payload CMS 3).
#
# Built WITHOUT database access or secrets: the pages are then rendered from
# the CMS on their first request and cached (see the locale layout). At start-up
# the container applies the pending database migrations, then serves the site.
#
#   docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are written into the browser code at build time.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ANALYTICS_PROVIDER=
ARG NEXT_PUBLIC_ANALYTICS_SCRIPT_URL=
ARG NEXT_PUBLIC_ANALYTICS_SITE_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ANALYTICS_PROVIDER=$NEXT_PUBLIC_ANALYTICS_PROVIDER \
    NEXT_PUBLIC_ANALYTICS_SCRIPT_URL=$NEXT_PUBLIC_ANALYTICS_SCRIPT_URL \
    NEXT_PUBLIC_ANALYTICS_SITE_ID=$NEXT_PUBLIC_ANALYTICS_SITE_ID \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# The application without its dependencies nor the build cache, shipped in its
# own layer below.
RUN mkdir /out \
 && tar --exclude=./node_modules --exclude=./.next/cache -cf - . | tar -xf - -C /out

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
# The sources stay in the image: `npm run migrate`, `npm run seed` and
# `npm run import:assets` run from them. The `node` user owns the app because
# the page cache (.next) and the media library (public/media) are written at
# run time.
# Dependencies first, in their own layer: it only changes with package-lock.json,
# so a deployment usually downloads just the much smaller application layer.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /out ./
RUN mkdir -p public/media/documents private/files && chown -R node:node public/media private
USER node
EXPOSE 4313
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:4313/api/health || exit 1
CMD ["sh", "-c", "npm run migrate && npm start"]
