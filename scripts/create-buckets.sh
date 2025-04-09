#!/bin/sh

set -e

echo "Esperando a que MINIO inicie correctamente..."

sleep 10

echo "MINIO está listo."

echo "configurando conexión con MINIO..."

mc alias set myminio http://minio:9000 "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

IFS=',' read -ra BUCKETS_ARRAY <<< "$CREATE_MINIO_BUCKETS"

for bucket in "${BUCKETS_ARRAY[@]}"; do
  echo "Creando el bucket: $bucket"
  # -p para que no falle si ya existe
  mc mb -p "myminio/$bucket" || echo "el bucket '$bucket' ya existe."
  mc policy set public "myminio/$bucket"
done

echo "Todos los buckets se han configurado correctamente."
exit 0
