import prompts from "prompts"
import { PaneImplementation } from "./types"

const formatOption = (option: any) => {
  switch (option.method) {
    case "otp":
      return `📱 authenticator app`
    case "sms":
      return `📞 text message to ${option.phone_number}`
    case "email":
      return `📧 email to ${option.email_address}`
    default:
      throw new Error("unknown 2FA method")
  }
}

const initiateTwoFactorPane: PaneImplementation = {
  name: "initiate_two_factor_pane",
  getInput: async ({ options }) => {
    const { id } = await prompts(
      {
        type: "select",
        name: "id",
        message: "Select a 2FA option",
        choices: options.map((o: any) => ({
          title: formatOption(o),
          value: o.id,
        })),
      },
      {
        onCancel: () => {
          process.exit(1)
        },
      }
    )

    return { id }
  },
}

export default initiateTwoFactorPane
