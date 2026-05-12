import path from 'path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `postgresql://postgres:kinleypem@localhost:5432/mess_db`

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    adapter() {
      return new PrismaPg({ connectionString })
    },
  },
})