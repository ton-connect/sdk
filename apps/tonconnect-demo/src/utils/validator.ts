import Ajv from "ajv"
import transactionSchema from "@/schemas/transaction.schema.json"
import signDataSchema from "@/schemas/sign-data.schema.json"

const ajv = new Ajv({ allErrors: true, verbose: true })

// Compile schemas
const validateTransaction = ajv.compile(transactionSchema)
const validateSignData = ajv.compile(signDataSchema)

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

function formatErrors(errors: typeof validateTransaction.errors): ValidationError[] {
  if (!errors) return []

  return errors.map((error) => ({
    path: error.instancePath || "/",
    message: error.message || "Invalid value",
  }))
}

export function validateTransactionJson(json: string): ValidationResult {
  try {
    const data = JSON.parse(json)
    const valid = validateTransaction(data)

    return {
      valid: !!valid,
      errors: formatErrors(validateTransaction.errors),
    }
  } catch {
    return {
      valid: false,
      errors: [{ path: "/", message: "Invalid JSON syntax" }],
    }
  }
}

export function validateSignDataJson(json: string): ValidationResult {
  try {
    const data = JSON.parse(json)

    // Extract payload from method/params wrapper if present
    const payload = data.params?.[0] ?? data

    const valid = validateSignData(payload)

    return {
      valid: !!valid,
      errors: formatErrors(validateSignData.errors),
    }
  } catch {
    return {
      valid: false,
      errors: [{ path: "/", message: "Invalid JSON syntax" }],
    }
  }
}

export function parseJsonSafe<T>(json: string): { data: T | null; error: string | null } {
  try {
    return { data: JSON.parse(json) as T, error: null }
  } catch {
    return { data: null, error: "Invalid JSON syntax" }
  }
}
