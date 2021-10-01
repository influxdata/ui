# Webhooks Input Plugin

This is a Telegraf service plugin that start an http server and register multiple webhook listeners.

```sh
$ telegraf config -input-filter webhooks -output-filter influxdb > config.conf.new
```

Change the config file to point to the InfluxDB server you are using and adjust the settings to match your environment. Once that is complete:

```sh
$ cp config.conf.new /etc/telegraf/telegraf.conf
$ sudo service telegraf start
```


### Configuration:

```toml
[[inputs.webhooks]]
  ## Address and port to host Webhook listener on
  service_address = ":1619"

  [inputs.webhooks.filestack]
    path = "/filestack"

  [inputs.webhooks.github]
    path = "/github"
    # secret = ""

  [inputs.webhooks.mandrill]
    path = "/mandrill"

  [inputs.webhooks.rollbar]
    path = "/rollbar"

  [inputs.webhooks.papertrail]
    path = "/papertrail"

  [inputs.webhooks.particle]
    path = "/particle"
```


### Available webhooks

- <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/filestack" target="_blank">Filestack</a>
- <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/github" target="_blank">Github</a>
- <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/mandrill" target="_blank">Mandrill</a>
- <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/rollbar" target="_blank">Rollbar</a>
- <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/papertrail" target="_blank">Papertrail</a>
- <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/particle" target="_blank">Particle</a>


### Adding new webhooks plugin

1. Add your webhook plugin inside the `webhooks` folder
1. Your plugin must implement the `Webhook` interface
1. Import your plugin in the `webhooks.go` file and add it to the `Webhooks` struct

Both <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/github" target="_blank">Github</a> and <a href="https://github.com/influxdata/telegraf/tree/master/plugins/inputs/webhooks/rollbar" target="_blank">Rollbar</a> are good examples to follow.
