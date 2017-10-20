//
//  HTTPDownloadRequest.swift
//  KeymanEngine
//
//  Created by Gabriel Wong on 2017-09-15.
//  Copyright © 2017 SIL International. All rights reserved.
//

@objc public enum DownloadType: Int {
  case downloadFile
  case downloadCachedData
}

public class HTTPDownloadRequest: NSObject {
  @objc public let url: URL
  @objc public let typeCode: DownloadType
  // TODO: Make values of this dict properties of the class
  @objc public var userInfo: [String: Any]
  var task: URLSessionTask?
  @objc public var destinationFile: String?
  @objc public var rawResponseData: Data?
  @objc public var tag: Int = 0

  @objc public init(url: URL, downloadType type: DownloadType, userInfo info: [String: Any]) {
    self.url = url
    typeCode = type
    userInfo = info
    super.init()
  }

  @objc public convenience init(url: URL) {
    self.init(url: url, downloadType: DownloadType.downloadFile, userInfo: [:])
  }

  @objc public convenience init(url: URL, userInfo info: [String: Any]) {
    self.init(url: url, downloadType: DownloadType.downloadFile, userInfo: info)
  }

  @objc public convenience init(url: URL, downloadType type: DownloadType) {
    self.init(url: url, downloadType: type, userInfo: [:])
  }

  var responseStatusCode: Int? {
    if let response = task?.response as? HTTPURLResponse {
      return response.statusCode
    }
    return nil
  }

  // TODO: Remove
  @objc public var responseStatusCodeObjc: Int {
    if let code = responseStatusCode {
      return code
    }
    return -1
  }

  @objc public var responseStatusMessage: String? {
    guard let statusCode = responseStatusCode else {
      return nil
    }
    return HTTPURLResponse.localizedString(forStatusCode: statusCode)
  }

  @objc public var error: Error? {
    return task?.error
  }
}
