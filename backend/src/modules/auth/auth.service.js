const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma =
  require("../../config/database");

const transporter =
  require("../../config/email");

const register = async (
  data
) => {
  const {
    name,
    email,
    password,
  } = data;

  const existingUser =
    await prisma.user.findUnique({
      where: { email },
    });

  if (existingUser) {
    throw new Error(
      "Email already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  const token =
    crypto
      .randomBytes(32)
      .toString("hex");

  const expiry =
    new Date(
      Date.now() +
        24 *
          60 *
          60 *
          1000
    );

  const user =
    await prisma.user.create({
      data: {
        name,
        email,
        password:
          hashedPassword,
        verificationToken:
          token,
        verificationExpiry:
          expiry,
      },
    });

  const verificationLink =
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from:
      process.env.SENDER_EMAIL,
    to: email,
    subject:
      "Verify Email",
    html: `
      <h2>Hello ${name}</h2>

      <p>
      Click below to verify your email.
      </p>

      <a href="${verificationLink}">
      Verify Email
      </a>
    `,
  });

  return {
    success: true,
    message:
      "Registration successful. Check your email.",
  };
};

const verifyEmail =
  async (token) => {
    const user =
      await prisma.user.findFirst({
        where: {
          verificationToken:
            token,
          verificationExpiry:
            {
              gt: new Date(),
            },
        },
      });

    if (!user) {
      throw new Error(
        "Invalid or expired token"
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
        verificationToken:
          null,
        verificationExpiry:
          null,
      },
    });

    return {
      success: true,
      message:
        "Email verified successfully",
    };
  };

module.exports = {
  register,
  verifyEmail,
};