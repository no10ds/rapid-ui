import { Card, Row, Button, Select } from '@/components'
import ErrorCard from '@/components/ErrorCard/ErrorCard'
import AccountLayout from '@/components/Layout/AccountLayout'
import { getDatasetsUi } from '@/service'
import { FormControl, Typography, LinearProgress } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function UserModifyPage() {
  const router = useRouter()
  const [dataset, setDataset] = useState<string>('')
  const [versions, setVersions] = useState(0)
  const [versionSelected, setVersionSelected] = useState(0)

  const {
    isLoading: isDatasetsListLoading,
    data: datasetsList,
    error: datasetsError
  } = useQuery(['datasetsList'], getDatasetsUi)

  useEffect(() => {
    if (datasetsList) {
      const firstKey = Object.keys(datasetsList)[0]
      setDataset(`${firstKey}/${datasetsList[firstKey][0].dataset}`)
    }
  }, [datasetsList])

  useEffect(() => {
    let version = 0
    if (dataset) {
      const splits = dataset.split('/')
      const domain = splits[0]
      const _dataset = splits[1]
      version = parseInt(
        datasetsList[domain].filter((item) => item.dataset === _dataset)[0].version
      )
    }
    setVersions(version)
    setVersionSelected(version ? 1 : 0)
  }, [dataset])

  if (isDatasetsListLoading) {
    return <LinearProgress />
  }

  if (datasetsError) {
    return <ErrorCard error={datasetsError as Error} />
  }

  return (
    <Card
      action={
        <Button
          color="primary"
          onClick={() =>
            router.push(`/data/download/${dataset}?version=${versionSelected}`)
          }
        >
          Next
        </Button>
      }
    >
      <Typography variant="h2">Select subject</Typography>

      <Row>
        <FormControl fullWidth size="small">
          <Select
            label="Select a dataset"
            onChange={(event) => setDataset(event.target.value as string)}
            native
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

      {versions && (
        <>
          <Typography variant="h2">Select version</Typography>

          <Row>
            <Select
              label="Select version"
              onChange={(event) => setVersionSelected(event.target.value as number)}
              native
            >
              {Array(versions)
                .fill(0)
                .map((_, index) => (
                  <option value={index + 1} key={index}>
                    {index + 1}
                  </option>
                ))}
            </Select>
          </Row>
        </>
      )}
    </Card>
  )
}

export default UserModifyPage

UserModifyPage.getLayout = (page) => (
  <AccountLayout title="Download">{page}</AccountLayout>
)
