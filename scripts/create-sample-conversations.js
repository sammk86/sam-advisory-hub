const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating sample conversations...');

  // Find or create a test admin user
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!adminUser) {
    console.log('Creating admin user...');
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@samadvisoryhub.com',
        name: 'Admin User',
        role: 'ADMIN',
        isConfirmed: true,
        confirmedAt: new Date()
      }
    });
  }

  // Find or create a test client user
  let clientUser = await prisma.user.findFirst({
    where: { role: 'CLIENT' }
  });

  if (!clientUser) {
    console.log('Creating client user...');
    clientUser = await prisma.user.create({
      data: {
        email: 'client@example.com',
        name: 'Test Client',
        role: 'CLIENT',
        isConfirmed: true,
        confirmedAt: new Date()
      }
    });
  }

  // Create sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      title: 'Support Request',
      participants: {
        create: [
          {
            userId: adminUser.id,
            role: 'ADMIN'
          },
          {
            userId: clientUser.id,
            role: 'MEMBER'
          }
        ]
      },
      messages: {
        create: [
          {
            senderId: clientUser.id,
            content: 'Hello! I need help with my mentorship program. I have some questions about the roadmap.',
            messageType: 'TEXT'
          },
          {
            senderId: adminUser.id,
            content: 'Hi! I\'d be happy to help you with your mentorship program. What specific questions do you have about the roadmap?',
            messageType: 'TEXT'
          },
          {
            senderId: clientUser.id,
            content: 'I\'m working on the system design milestone and I\'m not sure about the scalability requirements. Could you provide some guidance?',
            messageType: 'TEXT'
          },
          {
            senderId: adminUser.id,
            content: 'Absolutely! For system design, scalability is crucial. Let\'s discuss both horizontal and vertical scaling approaches. I\'ll send you some resources and we can schedule a session to go through this in detail.',
            messageType: 'TEXT'
          }
        ]
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  // Update unread counts for the admin (last message is from client)
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId: adminUser.id
      }
    },
    data: {
      unreadCount: 1
    }
  });

  console.log('✅ Sample conversation created successfully!');
  console.log('Conversation ID:', conversation.id);
  console.log('Admin User ID:', adminUser.id);
  console.log('Client User ID:', clientUser.id);
  console.log('Messages count:', conversation.messages.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
