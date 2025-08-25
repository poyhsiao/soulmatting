{{/*
SoulMatting Auth Service - Helm Template Helpers
Author: Kim Hsiao
Version: 1.0.0
Created: 2024-01-20
Last Updated: 2024-01-20
*/}}

{{/*
Expand the name of the chart.
*/}}
{{- define "soulmatting-auth-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "soulmatting-auth-service.fullname" -}}
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
{{- define "soulmatting-auth-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "soulmatting-auth-service.labels" -}}
helm.sh/chart: {{ include "soulmatting-auth-service.chart" . }}
{{ include "soulmatting-auth-service.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: soulmatting
app.kubernetes.io/component: auth-service
{{- end }}

{{/*
Selector labels
*/}}
{{- define "soulmatting-auth-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "soulmatting-auth-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "soulmatting-auth-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "soulmatting-auth-service.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the secret to use
*/}}
{{- define "soulmatting-auth-service.secretName" -}}
{{- if .Values.secrets.enabled }}
{{- default (printf "%s-secrets" (include "soulmatting-auth-service.fullname" .)) .Values.secrets.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the configmap to use
*/}}
{{- define "soulmatting-auth-service.configMapName" -}}
{{- if .Values.configMap.enabled }}
{{- default (printf "%s-config" (include "soulmatting-auth-service.fullname" .)) .Values.configMap.name }}
{{- end }}
{{- end }}