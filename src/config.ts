function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export const config = {
  // OCI auth
  tenancyId: required("OCI_TENANCY_OCID"),
  userId: required("OCI_USER_OCID"),
  fingerprint: required("OCI_FINGERPRINT"),
  privateKey: required("OCI_PRIVATE_KEY").replace(/\\n/g, "\n"), // convert ke newline jika ada
  region: required("OCI_REGION"),

  // target resource
  compartmentId: required("OCI_COMPARTMENT_ID"),
  availabilityDomain: required("OCI_AVAILABILITY_DOMAIN"),
  subnetId: required("OCI_SUBNET_ID"),
  imageId: required("OCI_IMAGE_ID"),
  shape: process.env.INSTANCE_SHAPE || "VM.Standard.A1.Flex",
  ocpus: Number(process.env.INSTANCE_OCPUS || 2),
  memoryInGBs: Number(process.env.INSTANCE_MEMORY_GB || 12),
  displayName: process.env.INSTANCE_DISPLAY_NAME || "auto-arm-vm",
  sshPublicKey: required("SSH_PUBLIC_KEY"),

  // telegram
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  telegramChatId: required("TELEGRAM_CHAT_ID"),

  // behavior
  notifyOnEveryAttempt:
    (process.env.NOTIFY_ON_EVERY_ATTEMPT || "false").toLowerCase() === "true",
};
