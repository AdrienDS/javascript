import type ora from "ora"
import getClientFromArgs from "../get-client-from-args"
import { GlobalOptions } from "../global-options"
import panes from "./panes"
import { formatErrorMsg } from "./utils"

const completeInteractiveLogin = async (
  connectWebviewId: string,
  args: GlobalOptions
) => {
  const { client } = getClientFromArgs(args)

  const displaySpinner = typeof window === "undefined" && !args.quiet
  let spinner: ora.Ora | undefined
  if (displaySpinner) {
    // Dynamic import so we don't bundle this for the browser
    const ora = await import("ora")

    spinner = ora.default("Logging in...")
  }

  let submit_props: any
  while (true) {
    console.clear()

    try {
      spinner?.start("Loading...")
      const { data } = await client.post(
        "/internal/connect_webviews/login/next",
        {
          connect_webview_id: connectWebviewId,
          submit_props,
        }
      )
      spinner?.stop()

      const currentPane = data.pane

      if (currentPane.name === "finished_pane") {
        break
      }

      const handler = panes.find((p) => p.name === currentPane.name)
      if (!handler) {
        throw new Error(`Unknown pane ${currentPane.name}`)
      }

      if (currentPane.render_props.error_msg) {
        console.error(formatErrorMsg(currentPane.render_props.error_msg))
      }

      submit_props = await handler.getInput(currentPane.render_props)
    } catch (error) {
      if (spinner) {
        spinner.fail((error as Error).message)
      } else {
        console.error(error)
      }

      process.exit(1)
    }
  }

  spinner?.succeed("🎉 login successful!")
}

export default completeInteractiveLogin
