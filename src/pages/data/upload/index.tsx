import { Card, Row, Button, Select, Alert, Link } from '@/components'
import ErrorCard from '@/components/ErrorCard/ErrorCard'
import AccountLayout from '@/components/Layout/AccountLayout'
import { getDatasetsUi, uploadDataset } from '@/service'
import { UploadDatasetResponse, UploadDatasetResponseDetails } from '@/service/types'
import { FormControl, Typography, LinearProgress } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

function UserModifyPage() {
  const [file, setFile] = useState<File | undefined>()
  const [dataset, setDataset] = useState<string>('')
  const [uploadSuccessDetails, setUploadSuccessDetails] = useState<
    UploadDatasetResponseDetails | undefined
  >()

  const {
    isLoading: isDatasetsListLoading,
    data: datasetsList,
    error: datasetsError
  } = useQuery(['datasetsList'], getDatasetsUi)

  const { isLoading, mutate, error } = useMutation<
    UploadDatasetResponse,
    Error,
    { path: string; data: FormData }
  >({
    mutationFn: uploadDataset,
    onMutate: () => {
      setUploadSuccessDetails(undefined)
    },
    onSuccess: (data) => {
      setUploadSuccessDetails(data.details)
    }
  })

  useEffect(() => {
    if (datasetsList) {
      const firstKey = Object.keys(datasetsList)[0]
      setDataset(`${firstKey}/${datasetsList[firstKey][0].dataset}`)
    }
  }, [datasetsList])

  if (isDatasetsListLoading) {
    return <LinearProgress />
  }

  if (datasetsError) {
    return <ErrorCard error={datasetsError as Error} />
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append('file', file)
        await mutate({ path: dataset, data: formData })
      }}
    >
      <Card
        action={
          <Button color="primary" type="submit" loading={isLoading}>
            Upload dataset
          </Button>
        }
      >
        <Typography variant="body1" gutterBottom>
          Upload a new file to the selected data source. It assumes a given a schema has
          been uploaded for the data source and the data to upload matches this schema.
        </Typography>

        <Typography variant="h2" gutterBottom>
          Select subject
        </Typography>

        <Row>
          <FormControl fullWidth size="small">
            <Select
              label="Select dataset"
              onChange={(event) => setDataset(event.target.value as string)}
              native
              inputProps={{ 'data-testid': 'select-dataset' }}
            >
              {Object.keys(datasetsList).map((key) => (
                <optgroup label={key} key={key}>
                  {datasetsList[key].map((item) => (
                    <option value={`${key}/${item.dataset}`} key={item.dataset}>
                      {item.dataset}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </FormControl>
        </Row>

        <Row>
          <input
            name="file"
            id="file"
            type="file"
            data-testid="upload"
            onChange={(event) => setFile(event.target.files[0])}
          />
        </Row>

        {uploadSuccessDetails ? (
          <Alert title={`File accepted: ${uploadSuccessDetails.original_filename}`}>
            <Typography variant="body2">
              Raw file name: {uploadSuccessDetails.raw_filename}
            </Typography>
            <Typography variant="body2">Status: {uploadSuccessDetails.status}</Typography>
            <Typography variant="body2">
              Version: {uploadSuccessDetails.dataset_version}
            </Typography>

            <Link href={`/tasks/${uploadSuccessDetails.job_id}`}>
              Track upload progress
            </Link>
          </Alert>
        ) : null}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error?.message}
          </Alert>
        )}
      </Card>
    </form>
  )
}

export default UserModifyPage

UserModifyPage.getLayout = (page) => <AccountLayout title="Upload">{page}</AccountLayout>
