import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/convex/_generated/api'
import { Scripts } from '@/lib/utils'
import { useMutation } from 'convex/react'
import { Download, Trash2 } from 'lucide-react'
import { Dispatch, SetStateAction, useState } from 'react'

type StoreType = 'kv' | 'file'

interface DataStoreDialogProps {
  kvData?: Scripts['kv']
  fileData?: Scripts['file']
  webhookOrigin: string
  fingerprintId: string
  trigger?: React.ReactNode
  show?: boolean
  setShow?: Dispatch<SetStateAction<boolean>>
}

export function DataStoreDialog({
  kvData = [],
  fileData = [],
  trigger,
  fingerprintId,
  webhookOrigin,
  show,
  setShow,
}: DataStoreDialogProps) {
  const [storeType, setStoreType] = useState<StoreType>('kv')
  const deleteKvEntry = useMutation(api.scripting.deleteKvEntry)
  const deleteFileEntry = useMutation(api.scripting.deleteFileEntry)

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-w-88 md:max-w-2xl translate-y-1 top-10 p-1.5 gap-0 bg-accentx bg-background border-none rounded-2xl sm:rounded-2xl dark:ring ring-muted-foreground/25"
        moreItems={
          <Select
            value={storeType}
            onValueChange={(value) => setStoreType(value as StoreType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kv">KV Store</SelectItem>
              <SelectItem value="file">File Store</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Data Store</DialogTitle>
          <DialogDescription>Manage your kv or file storage</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-2">
          {storeType === 'kv' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">KV Store</h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {kvData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No key-value pairs yet
                  </p>
                ) : (
                  kvData.map((item) => (
                    <div key={item.key} className="flex gap-2 items-center">
                      <Input
                        disabled
                        placeholder="Key"
                        defaultValue={item.key}
                        className="flex-1"
                      />
                      <Input
                        disabled
                        placeholder="Value"
                        defaultValue={String(item.value)}
                        className="flex-1"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          deleteKvEntry({
                            fingerprintId,
                            webhookOrigin,
                            key: item.key,
                          })
                        }
                        className="size-7 text-red-500 hover:text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 opacity-80" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {storeType === 'file' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Files Store</h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {fileData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No files yet
                  </p>
                ) : (
                  fileData.map((item) => (
                    <div
                      key={item.fileName}
                      className="flex gap-x-2 items-center"
                    >
                      <Input
                        disabled
                        placeholder="File Name"
                        defaultValue={item.fileName}
                        className="flex-1"
                      />

                      <div className="flex items-center gap-x-2.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            item.downloadUrl &&
                              window.open(item.downloadUrl, '_blank')
                          }}
                          className="size-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Download className="h-4 opacity-80 transition-opacity" />
                          <span className="sr-only">Download file</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteFileEntry({
                              fingerprintId,
                              webhookOrigin,
                              storageId: item.storageId,
                            })
                          }
                          className="size-7 text-red-500 hover:text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 opacity-80" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
