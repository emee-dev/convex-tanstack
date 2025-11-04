// import vm from 'node:vm'
// import { z } from 'zod'

// // ---- Schemas ----
// const ExecuteSchema = z.object({
//   code: z.string().min(1, 'Code is required'),
//   args: z.any().optional(),
// })

// // ---- Log Store ----
// const evalLogs: { level: 'log' | 'error'; message: string }[] = []

// function formatValue(value: any): string {
//   const type = typeof value

//   if (
//     type === 'string' ||
//     type === 'number' ||
//     type === 'boolean' ||
//     value === null
//   ) {
//     return String(value)
//   }

//   try {
//     return JSON.stringify(value, null, 2)
//   } catch {
//     // fallback for circular or unserializable values
//     return '[Unserializable Object]'
//   }
// }

// // ---- Helper: Format multiple console args ----
// function formatArgs(args: any[]): string {
//   return args.map(formatValue).join(' ')
// }

// const ctx = {
//   z,
//   args: null as any,
//   console: {
//     log: (...values: any[]) => {
//       evalLogs.push({
//         level: 'log',
//         message: formatArgs(values),
//       })
//     },
//     error: (...values: any[]) => {
//       evalLogs.push({
//         level: 'error',
//         message: formatArgs(values),
//       })
//     },
//   },
// }

// // Make the context persistent
// vm.createContext(ctx)

// // ---- Core Sandbox Function ----
// export async function runCode(input: unknown): Promise<{
//   success: boolean
//   logs: typeof evalLogs
//   result?: any
//   error?: string
// }> {
//   const parsed = ExecuteSchema.safeParse(input)
//   if (!parsed.success) {
//     return {
//       success: false,
//       logs: [],
//       error: parsed.error.message,
//     }
//   }

//   const { code, args } = parsed.data
//   ctx.args = args
//   evalLogs.length = 0 // clear logs for each run

//   try {
//     const wrapped = `
//       (async () => {
//         try {
//           ${code}
//         } catch (err) {
//           console.error(err?.message || err);
//         }
//       })()
//     `

//     const result = await vm.runInContext(wrapped, ctx)
//     return { success: true, logs: [...evalLogs], result }
//   } catch (err: any) {
//     return { success: false, logs: [...evalLogs], error: err.message }
//   }
// }

const sampleCode = `
// 1️⃣ Define your schema
const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().positive(),
  email: z.string().email(),
});

// 2️⃣ Example input
const input = { name: "Emmanuel", age: 25, email: "emmanuel@example.com" };

// 3️⃣ Validate
const result = UserSchema.safeParse(input);

if (result.success) {
  console.log("✅ Valid user:", result.data);
} else {
  console.error("❌ Validation errors:", result.error.format());
}
`

// const output = await runCode({ code: sampleCode, args: { test: 1 } })
// console.log(JSON.stringify(output, null, 2))

import vm from 'node:vm'
import { z } from 'zod'

function formatValue(value: any): string {
  const type = typeof value

  if (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    value === null
  ) {
    return String(value)
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    // fallback for circular or unserializable values
    return '[Unserializable Object]'
  }
}

function formatArgs(args: any[]): string {
  return args.map(formatValue).join(' ')
}

type Logs = { level: 'log' | 'error'; message: string }

// Make the context persistent

export async function runCode(code: string): Promise<{
  success: boolean
  result?: any
  logs: Logs[]
  error?: string
}> {
  const evalLogs: Logs[] = []

  const ctx = {
    z,
    console: {
      log: (...values: any[]) => {
        evalLogs.push({
          level: 'log',
          message: formatArgs(values),
        })
      },
      error: (...values: any[]) => {
        evalLogs.push({
          level: 'error',
          message: formatArgs(values),
        })
      },
    },
  }

  vm.createContext(ctx)
  evalLogs.length = 0 // clear logs for each run

  try {
    const wrapped = `
      (async () => {
        try {
          ${code}
        } catch (err) {
          console.error(err?.message || err);
        }
      })()
    `

    const result = await vm.runInContext(wrapped, ctx)
    return { success: true, logs: evalLogs, result }
  } catch (err: any) {
    return { success: false, logs: evalLogs, error: err.message }
  }
}

const output = await runCode(sampleCode)
console.log(JSON.stringify(output, null, 2))
