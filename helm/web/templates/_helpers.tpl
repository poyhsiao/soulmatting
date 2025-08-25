{{/*
Expand the name of the chart.
*/}}
{{- define "soulmatting-web.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "soulmatting-web.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "soulmatting-web.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "soulmatting-web.labels" -}}
helm.sh/chart: {{ include "soulmatting-web.chart" . }}
{{ include "soulmatting-web.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: soulmatting
app.kubernetes.io/component: web
{{- end }}

{{/*
Selector labels
*/}}
{{- define "soulmatting-web.selectorLabels" -}}
app.kubernetes.io/name: {{ include "soulmatting-web.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "soulmatting-web.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "soulmatting-web.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate certificates secret name
*/}}
{{- define "soulmatting-web.secretName" -}}
{{- printf "%s-tls" (include "soulmatting-web.fullname" .) }}
{{- end }}

{{/*
Generate basic auth secret name
*/}}
{{- define "soulmatting-web.basicAuthSecretName" -}}
{{- printf "%s-basic-auth" (include "soulmatting-web.fullname" .) }}
{{- end }}