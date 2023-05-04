import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fetchMock from 'jest-fetch-mock'
import { mockDataset, mockDataSetsList, renderWithProviders, selectAutocompleteOption } from '@/lib/test-utils'
import UploadPage from '@/pages/data/upload'
import { UploadDatasetResponse } from '@/service/types'


const pushSpy = jest.fn()
jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn(() => ({
    locale: 'en',
    push: pushSpy
  }))
}))

describe('Page: Upload page', () => {
  afterEach(() => {
    fetchMock.resetMocks()
    jest.clearAllMocks()
  })

  it('renders', async () => {

    fetchMock.mockResponseOnce(JSON.stringify(mockDataSetsList), { status: 200 })
    renderWithProviders(<UploadPage datasetInput={mockDataset} />)

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))

    const datasetDropdown = screen.getByTestId('select-dataset')
    expect(datasetDropdown).toBeVisible()

    expect(screen.getByTestId('upload')).toBeInTheDocument()
  })

  it('error on fetch', async () => {
    fetchMock.mockReject(new Error('fake error message'))
    renderWithProviders(<UploadPage datasetInput={mockDataset} />)

    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))

    await waitFor(async () => {
      expect(screen.getByText('fake error message')).toBeInTheDocument()
    })
  })

  describe('on submit', () => {
    const file = new File(['test'], 'testfile.txt', { type: 'text/plain' })

    it('success', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockDataSetsList), { status: 200 })
      renderWithProviders(<UploadPage />)

      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))


      selectAutocompleteOption('select-layer', 'layer')
      selectAutocompleteOption('select-domain', 'Pizza')
      selectAutocompleteOption('select-dataset', 'bit_complicated')

      await fireEvent.change(screen.getByTestId('upload'), {
        target: { files: [file] }
      })

      await userEvent.click(screen.getByTestId('submit'))

      await waitFor(async () => {
        expect(fetchMock).toHaveBeenLastCalledWith(
          '/api/datasets/layer/Pizza/bit_complicated?version=3',
          expect.objectContaining({
            body: new FormData(),
            credentials: 'include',
            method: 'POST'
          })
        )
      })
    })

    it('upload status', async () => {
      const mockSuccess: UploadDatasetResponse = {
        details: {
          dataset_version: 12314,
          job_id: 'abc123',
          original_filename: 'my_original_name.txt',
          raw_filename: 'my_raw_name.txt',
          status: 'winning'
        }
      }

      fetchMock.mockResponses(
        [JSON.stringify(mockDataSetsList), { status: 200 }],
        [JSON.stringify(mockSuccess), { status: 200 }]
      )
      renderWithProviders(<UploadPage datasetInput={mockDataset} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))

      await userEvent.click(screen.getByTestId('submit'))

      await waitFor(async () => {
        expect(screen.getByTestId('upload-status')).toBeInTheDocument()
      })

      const trackLink = screen.getByText('Track upload progress')

      expect(screen.getByText('Raw file name: my_raw_name.txt')).toBeInTheDocument()
      expect(screen.getByText('Status: winning')).toBeInTheDocument()
      expect(screen.getByText('Status: winning')).toBeInTheDocument()
      expect(screen.getByText('Version: 12314')).toBeInTheDocument()
      expect(trackLink).toBeInTheDocument()
      expect(trackLink).toHaveAttribute('href', '/tasks/abc123')
    })


    it('api error upload', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockDataSetsList), { status: 200 })
      renderWithProviders(<UploadPage datasetInput={mockDataset} />)
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'))

      fetchMock.mockReject(new Error('fake error message'))
      await userEvent.click(screen.getByTestId('submit'))

      await waitFor(async () => {
        expect(screen.getByText('fake error message')).toBeInTheDocument()
      })
    })
  })
})
