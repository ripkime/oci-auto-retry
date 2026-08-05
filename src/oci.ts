import * as common from "oci-common";
import * as core from "oci-core";

import { config } from "./config";

export function createComputeClient(): core.ComputeClient {
  const provider = new common.SimpleAuthenticationDetailsProvider(
    config.tenancyId,
    config.userId,
    config.fingerprint,
    config.privateKey,
    null,
    common.Region.fromRegionId(config.region),
  );

  return new core.ComputeClient({
    authenticationDetailsProvider: provider,
  });
}

const ACTIVE_STATES = ["PROVISIONING", "STARTING", "RUNNING"];

// cek instance dengan displayName yang sudah ada & aktif untuk mencegah duplikat

export async function findExistingInstance(client: core.ComputeClient) {
  const response = await client.listInstances({
    compartmentId: config.compartmentId,
    displayName: config.displayName,
  });

  return response.items.find((instance) =>
    ACTIVE_STATES.includes(instance.lifecycleState as string),
  );
}

export async function launchInstance(client: core.ComputeClient) {
  const request: core.requests.LaunchInstanceRequest = {
    launchInstanceDetails: {
      compartmentId: config.compartmentId,
      availabilityDomain: config.availabilityDomain,
      shape: config.shape,
      shapeConfig: {
        ocpus: config.ocpus,
        memoryInGBs: config.memoryInGBs,
      },
      displayName: config.displayName,
      sourceDetails: {
        sourceType: "image",
        imageId: config.imageId,
      } as core.models.InstanceSourceViaImageDetails,
      createVnicDetails: {
        subnetId: config.subnetId,
        assignPublicIp: true,
      },
      metadata: {
        ssh_authorized_keys: config.sshPublicKey,
      },
    },
  };

  return client.launchInstance(request);
}
