{{- define "event-driven-app.name" -}}
event-driven-app
{{- end }}

{{- define "event-driven-app.fullname" -}}
{{ .Release.Name }}-event-driven-app
{{- end }}
