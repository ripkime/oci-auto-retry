import { config } from "./config";
import {
  createComputeClient,
  findExistingInstance,
  launchInstance,
} from "./oci";
import { sendTelegram } from "./telegram";

async function main() {
  const timestamp = new Date().toISOString();
  const client = createComputeClient();

  // cek instance untuk mencegah double launch
  try {
    const existing = await findExistingInstance(client);
    if (existing) {
      console.log(
        `[${timestamp}] Instance "${config.displayName}" sudah ada (state: ${existing.lifecycleState}).`,
      );
      return;
    }
  } catch (error) {
    console.error(`[${timestamp}] Gagal cek instance existing:`, error);
    await sendTelegram(
      `⚠️ <b>OCI Auto-Retry</b>\nGagal cek instance existing (kemungkinan auth/config salah). Cek log GitHub Actions.\n\n<code>${String(
        error,
      ).slice(0, 300)}</code>`,
    );
    process.exitCode = 1;
    return;
  }

  // try launch
  try {
    const response = await launchInstance(client);
    const instanceId = response.instance.id;

    console.log(`[${timestamp}] Sukses! Instance ID: ${instanceId}`);
    await sendTelegram(
      `✅ <b>VM berhasil di-provision!</b>\n\n` +
        `Nama: ${config.displayName}\n` +
        `Shape: ${config.shape} (${config.ocpus} OCPU / ${config.memoryInGBs}GB)\n` +
        `Instance OCID:\n<code>${instanceId}</code>\n\n`,
    );
  } catch (error: any) {
    const message: string = error?.message || String(error);
    const isCapacityIssue =
      /out of (host )?capacity|toomanyrequests|limitexceeded/i.test(message);

    console.log(
      `[${timestamp}] Gagal launch. Capacity issue: ${isCapacityIssue}. Error: ${message}`,
    );

    if (!isCapacityIssue) {
      await sendTelegram(
        `🛑 <b>OCI Auto-Retry error (bukan capacity issue)</b>\n` +
          `Kemungkinan ada yang salah di config/auth, perlu dicek manual.\n\n` +
          `<code>${message.slice(0, 500)}</code>`,
      );
      process.exitCode = 1;
      return;
    }

    if (config.notifyOnEveryAttempt) {
      await sendTelegram(`⏳ Masih out of capacity, retry lagi ~5 menit lagi.`);
    }
  }
}

main().catch(async (error) => {
  console.error("Unhandled error:", error);
  await sendTelegram(
    `🛑 <b>OCI Auto-Retry crash</b>\n<code>${String(error).slice(0, 500)}</code>`,
  );
  process.exitCode = 1;
});
