import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, external_accounts } = evt.data;

    // Find GitHub account if linked
    const githubAccount = external_accounts?.find(
      (account: any) => account.provider === "oauth_github"
    );

    await prisma.user.upsert({
      where: { id },
      update: {
        email: email_addresses?.[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        username: githubAccount?.username || null,
        githubId: githubAccount?.provider_user_id || null,
        updatedAt: new Date(),
      },
      create: {
        id,
        email: email_addresses?.[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        username: githubAccount?.username || null,
        githubId: githubAccount?.provider_user_id || null,
      },
    });

    console.log(`User ${id} synced to database`);
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      await prisma.user.delete({
        where: { id },
      }).catch(() => {
        // User might not exist in our DB yet
        console.log(`User ${id} not found in database`);
      });

      console.log(`User ${id} deleted from database`);
    }
  }

  return NextResponse.json({ success: true });
}

